import xwallet, { X_WALLET } from "./xwallet"
import zelcore, { ZELCORE } from "./zelcore"
import koala, { KOALA } from "./koala"
import spirekey, { SPIREKEY } from "./spireKey"
import wc, {WC} from "./wc"

export { X_WALLET, ZELCORE, KOALA, WC, SPIREKEY }
const providers = {
  X_WALLET: xwallet,
  ZELCORE: zelcore,
  KOALA: koala,
  WC: wc,
  SPIREKEY: spirekey,
}
export default providers;