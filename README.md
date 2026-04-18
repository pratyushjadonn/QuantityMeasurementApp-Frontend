# Quanment – React Frontend

Yeh React app aapki Spring Boot backend se connect hoti hai.

## Setup

```bash
npm install
npm start
```

App `http://localhost:3000` pe chalegi.

## Backend URL Change Karna

`.env` file mein:
```
REACT_APP_API_URL=http://localhost:8080
```

## Backend CORS Setting

`application.properties` mein ye line honi chahiye:
```
app.allowed-origins=http://localhost:3000
jwt.secret=yourSecretKeyHere
```

## Backend Unit Names (Java Enums)

| Type        | Units                                      |
|-------------|--------------------------------------------|
| Length      | INCHES, FEET, YARDS, CENTIMETERS           |
| Weight      | GRAM, KILOGRAM, POUND                      |
| Volume      | MILLILITRE, LITRE, GALLON                  |
| Temperature | CELSIUS, FAHRENHEIT, KELVIN                |

## Features
- Login / Signup (JWT Auth)
- Length, Weight, Volume, Temperature conversion
- Add, Subtract, Divide operations
- History (Backend DB se)
- Logout (Token blacklist)
