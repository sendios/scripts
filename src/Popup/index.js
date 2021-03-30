import Popup2 from './Popup2'
import Popup3 from './Popup3'
import Popup4 from './Popup4'

const Popups = {2: Popup2, 3: Popup3, 4: Popup4}

export default (settings) => Popups[settings.appearence_id || 2](settings)
