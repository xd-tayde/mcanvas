import MCanvas from './mcanvas'
import _mcrop from './mcrop'

export default MCanvas
export const MCrop = _mcrop

if(!window.MCanvas) window.MCanvas = MCanvas
if(!window.MCrop) window.MCrop = MCrop