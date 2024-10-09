const appInsights = require('applicationinsights')

const setup = () => {
  if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
    appInsights.setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING).start()
    console.log('App Insights running')
    if (appInsights.defaultClient) {
      const cloudRoleTag = appInsights.defaultClient.context.keys.cloudRole
      const appName = process.env.APPINSIGHTS_CLOUDROLE
      appInsights.defaultClient.context.tags[cloudRoleTag] = appName
    } else {
      console.error('App Insights defaultClient is not initialized.')
    }
  } else {
    console.log('App Insights not running!')
  }
}

module.exports = { setup }
