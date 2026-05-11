import xwallet, { X_WALLET } from "./xwallet"
import zelcore, { ZELCORE } from "./zelcore"
import koala, { KOALA } from "./koala"
import spirekey, { SPIREKEY } from "./spireKey"
import wc, {WC} from "./wc"
import metamask, { METAMASK } from "./metamask"
import magic, { MAGIC } from "./magic"
import chainweaver, { CHAINWEAVER } from "./chainweaver"
import chainweaverLegacy, { CHAINWEAVER_LEGACY } from "./chainweaver-legacy"

export { X_WALLET, ZELCORE, KOALA, WC, SPIREKEY, METAMASK, MAGIC, CHAINWEAVER, CHAINWEAVER_LEGACY }
const providers = {
  X_WALLET: xwallet,
  ZELCORE: zelcore,
  KOALA: koala,
  WC: wc,
  SPIREKEY: spirekey,
  METAMASK: metamask,
  MAGIC: magic,
  CHAINWEAVER: chainweaver,
  CHAINWEAVER_LEGACY: chainweaverLegacy,
}
export default providers;