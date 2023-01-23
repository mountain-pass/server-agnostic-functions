# To Run:

```
npm start
```

Open: http://localhost:8787/

Or

Run curl:

```
curl http://localhost:8787/hello?name=bob
hello bob

curl -X POST http://localhost:8787/upload?name=bob \
   -H "Content-Type: application/json" \
   -d '{ "name": "fred" }'
```
