# To Run:

(On a Mac M1...)

```
npm run aws:installcli:mac
npm run build
npm run start:arm
```

Open: http://localhost:3000/api/hello?name=bob

Or

Run curl:

```
curl http://localhost:3000/api/hello?name=bob

curl -X POST http://localhost:3000/api/upload?name=bob \
   -H "Content-Type: application/json" \
   -d '{ "name": "fred" }'
```
