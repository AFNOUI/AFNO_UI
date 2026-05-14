import { CompositeInputPrice } from "@/components/lab/composite-input/CompositeInputPrice";
import { CompositeInputPhone } from "@/components/lab/composite-input/CompositeInputPhone";
import { CompositeInputIconPrefix } from "@/components/lab/composite-input/CompositeInputIconPrefix";
import { CompositeInputButtonSuffix } from "@/components/lab/composite-input/CompositeInputButtonSuffix";
import { CompositeInputPassword } from "@/components/lab/composite-input/CompositeInputPassword";
import { CompositeInputSelectSuffix } from "@/components/lab/composite-input/CompositeInputSelectSuffix";
import { CompositeInputSearch } from "@/components/lab/composite-input/CompositeInputSearch";
import { CompositeInputDomain } from "@/components/lab/composite-input/CompositeInputDomain";
import { CompositeInputCreditCard } from "@/components/lab/composite-input/CompositeInputCreditCard";
import { CompositeInputUrl } from "@/components/lab/composite-input/CompositeInputUrl";

export default function CompositeInputPage() {
  return (
    <div className="space-y-8">
      <CompositeInputPrice />
      <CompositeInputPhone />
      <CompositeInputUrl />
      <CompositeInputIconPrefix />
      <CompositeInputButtonSuffix />
      <CompositeInputPassword />
      <CompositeInputSelectSuffix />
      <CompositeInputSearch />
      <CompositeInputDomain />
      <CompositeInputCreditCard />
    </div>
  );
}