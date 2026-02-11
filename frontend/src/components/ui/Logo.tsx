import logo from '../../assets/logo.png'

export default function Logo({ className = "h-12" }: { className?: string }) {
    return (
        <img
            src={logo}
            alt="Focus Arena"
            className={className}
        />
    )
}
