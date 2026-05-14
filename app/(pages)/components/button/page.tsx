import { ButtonSizes } from "@/components/lab/button/ButtonSizes";
import { ButtonStates } from "@/components/lab/button/ButtonStates";
import { ButtonVariants } from "@/components/lab/button/ButtonVariants";
import { ButtonWithIcons } from "@/components/lab/button/ButtonWithIcons";

export default function ButtonPage() {
    return (
        <div className="space-y-6">
            <ButtonVariants />
            <ButtonSizes />
            <ButtonWithIcons />
            <ButtonStates />
        </div>
    );
}
