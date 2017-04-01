# raspberrypi-bot
Raspberry Pi Bot - Controlled by a Restful API 

To get started:

`npm install`
`node app.js`

Open browser and navigate to https://localhost:3030/
Browser will show security warning (because we are using self-signed certificate), click on advanced and accept. 
That's it.

API:

`/forward/:steps`
Move forward N steps

`/backward/:steps`
Move backward N steps

Designed for the L293D motor, with both clockwise and anti-clockwise motion control.
http://www.rakeshmondal.info/L293D-Motor-Driver

