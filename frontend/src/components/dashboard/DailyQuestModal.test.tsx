import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import DailyQuestModal from './DailyQuestModal';
import { dailyQuestService } from '../../services/dailyQuest';

vi.mock('../../services/dailyQuest', () => ({
    dailyQuestService: {
        getDailyQuests: vi.fn(),
    },
}));

const mockedDailyQuestService = vi.mocked(dailyQuestService);

describe('DailyQuestModal', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        vi.useFakeTimers({ shouldAdvanceTime: true });
        vi.setSystemTime(new Date('2026-04-19T10:00:00.000Z'));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('opens once per day when daily quests exist', async () => {
        mockedDailyQuestService.getDailyQuests.mockResolvedValueOnce([
            {
                id: 1,
                title: 'Deep Work',
                targetCount: 1,
                unit: 'session',
                difficulty: 1,
                currentCount: 0,
                isCompleted: false,
                createdAt: '2026-04-19T00:00:00.000Z',
                lastProgressAt: null,
            },
        ]);

        render(<DailyQuestModal />);

        expect(await screen.findByText('Your run is waiting.')).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'OPEN CONTRACT BOARD' }));

        await waitFor(() => {
            expect(screen.queryByText('Your run is waiting.')).not.toBeInTheDocument();
        });
        expect(localStorage.getItem('daily_quest_seen_date')).toBe('2026-04-19');
    });

    it('stays closed after the user has seen todays dispatch', async () => {
        localStorage.setItem('daily_quest_seen_date', '2026-04-19');
        mockedDailyQuestService.getDailyQuests.mockResolvedValueOnce([]);

        render(<DailyQuestModal />);

        await waitFor(() => {
            expect(screen.queryByText('Your run is waiting.')).not.toBeInTheDocument();
        });
        expect(mockedDailyQuestService.getDailyQuests).not.toHaveBeenCalled();
    });
});
