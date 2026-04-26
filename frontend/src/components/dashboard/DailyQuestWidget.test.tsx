import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import DailyQuestWidget from './DailyQuestWidget';
import { dailyQuestService } from '../../services/dailyQuest';
import toast from 'react-hot-toast';

vi.mock('../../services/dailyQuest', () => ({
    dailyQuestService: {
        getDailyQuests: vi.fn(),
        logProgress: vi.fn(),
    },
}));

vi.mock('react-hot-toast', () => ({
    default: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

const mockedDailyQuestService = vi.mocked(dailyQuestService);
const mockedToast = vi.mocked(toast);

describe('DailyQuestWidget', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useRealTimers();
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders loaded quests with completion summary', async () => {
        mockedDailyQuestService.getDailyQuests.mockResolvedValueOnce([
            {
                id: 1,
                title: 'Morning Pushups',
                targetCount: 3,
                unit: 'reps',
                difficulty: 1,
                currentCount: 1,
                isCompleted: false,
                createdAt: '2026-04-19T00:00:00.000Z',
                lastProgressAt: null,
            },
            {
                id: 2,
                title: 'Deep Work',
                targetCount: 1,
                unit: 'session',
                difficulty: 2,
                currentCount: 1,
                isCompleted: true,
                createdAt: '2026-04-19T00:00:00.000Z',
                lastProgressAt: '2026-04-19T08:00:00.000Z',
            },
        ]);

        render(<DailyQuestWidget />);

        expect(await screen.findByText('Morning Pushups')).toBeInTheDocument();
        expect(screen.getByText('1 / 2 cleared')).toBeInTheDocument();
        expect(screen.getByText('1 / 3 reps')).toBeInTheDocument();
        expect(screen.getByText('1 / 1 session')).toBeInTheDocument();
    });

    it('retries after load failure', async () => {
        mockedDailyQuestService.getDailyQuests
            .mockRejectedValueOnce(new Error('network'))
            .mockResolvedValueOnce([
                {
                    id: 1,
                    title: 'Recovered Quest',
                    targetCount: 1,
                    unit: 'task',
                    difficulty: 1,
                    currentCount: 0,
                    isCompleted: false,
                    createdAt: '2026-04-19T00:00:00.000Z',
                    lastProgressAt: null,
                },
            ]);

        render(<DailyQuestWidget />);

        expect(await screen.findByText('Unable to load daily quests.')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'RETRY' }));

        expect(await screen.findByText('Recovered Quest')).toBeInTheDocument();
        expect(mockedDailyQuestService.getDailyQuests).toHaveBeenCalledTimes(2);
    });

    it('optimistically syncs punch progress and blocks repeat punches during cooldown', async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        vi.setSystemTime(new Date('2026-04-19T10:00:00.000Z'));

        let resolveProgress: ((value: unknown) => void) | undefined;
        const progressPromise = new Promise((resolve) => {
            resolveProgress = resolve;
        });

        mockedDailyQuestService.getDailyQuests.mockResolvedValueOnce([
            {
                id: 1,
                title: 'Meditation',
                targetCount: 2,
                unit: 'rounds',
                difficulty: 1,
                currentCount: 0,
                isCompleted: false,
                createdAt: '2026-04-19T00:00:00.000Z',
                lastProgressAt: null,
            },
        ]);
        mockedDailyQuestService.logProgress.mockReturnValueOnce(progressPromise as Promise<any>);

        render(<DailyQuestWidget />);

        const punchButton = await screen.findByRole('button', { name: 'Punch Meditation' });
        fireEvent.click(punchButton);

        const syncingButton = await screen.findByRole('button', { name: 'Punch Meditation' });
        expect(syncingButton).toBeDisabled();
        expect(syncingButton).toHaveTextContent('SYNCING');

        fireEvent.click(syncingButton);
        expect(mockedDailyQuestService.logProgress).toHaveBeenCalledTimes(1);

        await act(async () => {
            resolveProgress?.({
                id: 99,
                dailyQuestId: 1,
                date: '2026-04-19',
                currentCount: 1,
                isCompleted: false,
            });
            await progressPromise;
        });

        await waitFor(() => {
            expect(mockedDailyQuestService.logProgress).toHaveBeenCalledWith(1, 1);
        });

        expect(screen.getByText(/14:59|15:00/)).toBeInTheDocument();
        expect(mockedToast.success).toHaveBeenCalled();
        expect(mockedDailyQuestService.logProgress).toHaveBeenCalledTimes(1);
    });
});
