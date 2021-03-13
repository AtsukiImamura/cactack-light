import Strable from "@/app/model/interface/common/Strable";
import Treatable from "@/app/model/interface/common/Treatable";

export default abstract class Transformer<
  S extends Strable,
  T extends Treatable<S>
> {
  public abstract aggregate(value: S): Promise<T>;
}
