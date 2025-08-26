import xwallet, { X_WALLET } from "./xwallet"
import zelcore, { ZELCORE } from "./zelcore"
import koala, { KOALA } from "./koala"
import spirekey, { SPIREKEY } from "./spireKey"
import wc, {WC} from "./wc"
import metamask, { METAMASK } from "./metamask"

export { X_WALLET, ZELCORE, KOALA, WC, SPIREKEY, METAMASK }
const providers = {
  X_WALLET: xwallet,
  ZELCORE: zelcore,
  KOALA: koala,
  WC: wc,
  SPIREKEY: spirekey,
  METAMASK: metamask,
}
export default providers;