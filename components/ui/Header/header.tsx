"use client";
import { GiSettingsKnobs, GiSteampunkGoggles, GiVibratingBall } from "react-icons/gi"
import { Button } from "../Button/button"
import { PiPlus } from "react-icons/pi"
import { useRouter } from "next/navigation"

const Header = () => {
    const router = useRouter();
    return (
        <div className="w-full flex justify-between items-start">
            <div className="flex flex-col gap-2 text-left text-5xl font-light w-[50%]">
                <p className="flex items-center gap-2">
                    Managing <span><GiSteampunkGoggles /></span> The Team
                </p>
                <p className="flex items-center gap-2">
                    and <span><GiVibratingBall /></span> Workflows
                </p>
            </div>
            <div className="flex gap-4 items-center">
                <Button variant="icon" onClick={() => { }}><GiSettingsKnobs /></Button>
                <Button variant="primary" className="flex items-center gap-2 text-sm" onClick={() => { router.push('/dashboard/barbershops') }}><PiPlus /> Create a New Store</Button>
            </div>
        </div>
    )
}

export default Header
