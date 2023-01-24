// import MyAgnosticRoutes from 'common/src/MyAgnosticRoutes'
import AwsWrapper from '@mountainpass/server-agnostic-functions-aws'
import { AgnosticRouter } from '@mountainpass/server-agnostic-functions-core'

const router = new AgnosticRouter()

router.get('/', (req, res) => {
  res.headers.Location = '/hello?name=bob'
  res.status(307)
  res.send('')
})

router.get('/hello', (req, res) => {
  res.send(`hello ${req.query.name[0] || req.params.name || 'world'}`)
})

router.post('/upload', (req, res) => {
  res.json(req)
})

export const handler = AwsWrapper.wrap(MyAgnosticRoutes)

// export const getAllItemsHandler = async (event) => {
//     if (event.httpMethod !== 'GET') {
//         throw new Error(`getAllItems only accept GET method, you tried: ${event.httpMethod}`);
//     }

//     const response = {
//         statusCode: 200,
//         body: JSON.stringify({message: 'hello there'})
//     };

//     // All log statements are written to CloudWatch
//     console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
//     return response;
// }
