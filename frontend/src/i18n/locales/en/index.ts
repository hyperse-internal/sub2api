import adminAccessKeys from './adminAccessKeys'
import landing from './landing'
import common from './common'
import dashboard from './dashboard'
import channelMonitorV2 from './channelMonitorV2'
import batchImage from './batchImage'
import imageStudio from './imageStudio'
import quantModels from './quantModels'
import aboutAlphaio from './aboutAlphaio'
import admin from './admin'
import misc from './misc'

export default {
  adminAccessKeys,
  ...landing,
  ...common,
  ...dashboard,
  ...channelMonitorV2,
  ...batchImage,
  ...imageStudio,
  ...quantModels,
  ...aboutAlphaio,
  admin,
  ...misc,
}
