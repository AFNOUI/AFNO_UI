import { CardBasic } from "@/components/lab/card/CardBasic";
import { CardEvent } from "@/components/lab/card/CardEvent";
import { CardStats } from "@/components/lab/card/CardStats";
import { CardPricing } from "@/components/lab/card/CardPricing";
import { CardProfile } from "@/components/lab/card/CardProfile";
import { CardProgress } from "@/components/lab/card/CardProgress";
import { CardSocialPost } from "@/components/lab/card/CardSocialPost";
import { CardNotification } from "@/components/lab/card/CardNotification";

export default function CardPage() {
    return (
        <div className="space-y-8">
            <CardBasic />
            <CardStats />
            <CardPricing />
            <CardProfile />
            <CardSocialPost />
            <CardNotification />
            <CardProgress />
            <CardEvent />
        </div>
    );
}
