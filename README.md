culture_api-s_mobile_app
========================
Prerequisite
----------------------------
1. Install Ionic and Cordova [http://ionicframework.com/getting-started/]

How To - Build & install apk
----------------------------

0. While in terminal

1. Create new ionic project 
   > ionic start myProject

2. Open the new folder
   > cd myProject

3. Add cordova geolocation plugin
   > cordova plugin add org.apache.cordova.geolocation

4. Download project from github , open file , move and replace the folder [www] in myProject

5. Add an android platform
   > ionic platfrom add android

6. Build an apk for android mobile
   > ionic build

   and send the apk to mobile , apk is in folder platforms/android/ant-build/ellak-debug-unaligned.apk

7. Or test the application in a browser
   > ionic serve
