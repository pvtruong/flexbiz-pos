let  {app_title,app_description,app_logo,app_keywords,app_url,mainColor,facebook_app_id,GOOGLE_ANALYTICS_ID,vapidPublicKey} = require("./config.js");
const htmlTemplate = function ( reactDom=null,data=null,helmetData=null,appInfo=null) {
    let meta = helmetData?helmetData.meta.toString():null;
    let title = helmetData && helmetData.title?helmetData.title:`<title>${app_title}</title>`;
    return `
        <!DOCTYPE html><html lang="vi">
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <link rel="icon" type="image/png" href="/images/icon.png">
            ${title}
            ${ meta?meta:
              `<meta name="description" content="${app_description||''}"/>
              <meta property="og:locale" content="vi_VN" />
              <meta property="og:locale:alternate" content="en_US" />
              <meta property="og:type" content="website" />
              <meta property="og:title" content="${app_title||''}" />
              <meta property="og:description" content="${app_description||''}" />
              <meta property="og:url" content="${app_url||''}" />
              <meta property="og:site_name" content="${app_title||''}" />
              <meta property="og:image" content="${app_logo||''}" />
              <meta property="fb:app_id" content="${facebook_app_id||''}" />
              <meta property="og:image:width" content="600"/>
              <meta property="og:image:height" content="600"/>

              <meta name="twitter:card" content="summary_large_image" />
              <meta name="twitter:description" content="${app_description||''}" />
              <meta name="twitter:title" content="${app_title||''}" />
              <meta name="twitter:image" content="${app_logo||''}" />
              <meta name="twitter:site" content="${app_url||''}" />

              <meta name="theme-color" content="${mainColor}" />
              <meta name="apple-mobile-web-app-capable" content="yes"/>
              <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/>

              <meta name="keywords" content="${app_keywords||''}"/>`
             }
            <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500" />
            <script>
              var endpoint,key,authSecret;
              window.__data__ =  ${data?JSON.stringify(data):'null'};
            </script>
            ${GOOGLE_ANALYTICS_ID?
              `<!-- Global site tag (gtag.js) - Google Analytics -->
              <script async src='https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}'></script>
              <script>
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());

                gtag('config', '${GOOGLE_ANALYTICS_ID}');
              </script>`
              :
            ``
            }
            ${appInfo?
              `<script type="application/ld+json">
                {
                  "@context": "http://schema.org",
                  "@type": "GeneralContractor",
                  "name": "${appInfo.name}",
                  "address": {
                    "@type": "PostalAddress",
                    "streetAddress": "${appInfo.address}",
                    "addressLocality": "Ho Chi Minh",
                    "addressRegion": "Ho Chi Minh",
                    "postalCode": ""
                  },
                  "image": "${app_url}/images/logo.png",
                  "email": "${appInfo.email}",
                  "telePhone": "${appInfo.phone}",
                  "url": "${app_url}",
                  "openingHours": "Mo,Tu,We,Th,Fr 08:00-17:00",
                  "openingHoursSpecification": [ {
                    "@type": "OpeningHoursSpecification",
                    "dayOfWeek": [
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday"
                    ],
                    "opens": "08:00",
                    "closes": "17:00"
                  } ]
                }
              </script>`
              :
              ``
            }
            ${vapidPublicKey?
              `<script>
                if (Notification && navigator.serviceWorker) {
                  //function convert vapidPublicKey
                  function urlBase64ToUint8Array(base64String) {
                    const padding = '='.repeat((4 - base64String.length % 4) % 4);
                    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
                    const rawData = window.atob(base64);
                    const outputArray = new Uint8Array(rawData.length);
                    for (let i = 0; i < rawData.length; ++i) {
                      outputArray[i] = rawData.charCodeAt(i);
                    }
                    return outputArray;
                  }
                  //register
                  navigator.serviceWorker.register('/sw.js')
                  .then(function (serviceWorkerRegister) {
                    console.log("registed service worker")
                    const serviceWorker = serviceWorkerRegister.installing || serviceWorkerRegister.waiting || serviceWorkerRegister.active;
                    let whenRegistrationActive = Promise.resolve(serviceWorkerRegister);
                    if(!serviceWorkerRegister.active || serviceWorkerRegister.active.state !== 'activated') {
                      console.log("Waiting for service active...")
                      whenRegistrationActive = new Promise((resolve) => {
                        serviceWorker.addEventListener('statechange', function(e) {
                          if (e.target.state === 'activated') {
                            console.log("service worker actived")
                            resolve(serviceWorkerRegister);
                          }else{
                            console.log("current state of service worker is",e.target.state)
                          }
                        });
                      });
                    }
                    return whenRegistrationActive;
                  })
                  .then(function(serviceWorkerRegister){
                    return serviceWorkerRegister.pushManager.getSubscription().then(function (subscription) {
                      if (subscription) {
                        return subscription;
                      }
                      console.log("registering push...")
                      const convertedVapidKey = urlBase64ToUint8Array('${vapidPublicKey}');
                      return serviceWorkerRegister.pushManager.subscribe({userVisibleOnly: true,applicationServerKey: convertedVapidKey});
                    });
                  })
                  .then(function (subscription) {
                    console.log("regiestered push")
                    if (!subscription.endpoint) {
                      console.log("Browser is not supported push notification API.");
                    }else{
                      endpoint = JSON.stringify(subscription);
                    }
                  })
                  .catch(e=>{
                    console.error("error register worker", e);
                  })
                  if (Notification.permission !== "granted") {
                    Notification.requestPermission();
                  }
                }
              </script>`
              :
              ``
            }
        </head>
        <body>
            <div id="root">${ reactDom?reactDom:'' }</div>
            <script src="configs.js"></script>
            <script src="https://code.jquery.com/jquery-1.9.1.min.js"></script>
            <script src="/tipsy.js"></script>
            <script src="/dist/app.min.js"></script>
            
        </body>
        </html>
    `;
}

module.exports = htmlTemplate;