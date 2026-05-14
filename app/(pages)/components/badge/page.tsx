import { BadgeDefault } from "@/components/lab/badge/BadgeDefault";
import { BadgeOutline } from "@/components/lab/badge/BadgeOutline";
import { BadgeSecondary } from "@/components/lab/badge/BadgeSecondary";
import { BadgeDestructive } from "@/components/lab/badge/BadgeDestructive";

export default function BadgePage() {
    return (
        <div className="space-y-6">
            <BadgeDefault />
            <BadgeSecondary />
            <BadgeOutline />
            <BadgeDestructive />
        </div>
    );
}
