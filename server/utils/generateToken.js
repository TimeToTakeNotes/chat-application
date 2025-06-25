// Helper to organize user token generation:

const { connect } = require('getstream');
const coreClient = connect(process.env.STREAM_API_KEY, process.env.STREAM_API_SECRET, process.env.STREAM_APP_ID);

module.exports = (userId) => coreClient.createUserToken(userId);