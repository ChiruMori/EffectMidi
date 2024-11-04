# Effect Piano
- A solution for external light bar controller of effect piano

  including the program runs on windows and the code runs on arduino

- Check the useage in the README.md in the release

- Get the hardware installation help in the following link :

  https://www.bilibili.com/read/cv6327363
  
- Download release : 
  
  https://github.com/esun-z/Effect_Piano_light_controller/releases
  

## How it works

in short:

1. The program running on your windows device use portmidi to read messages from midi port
2. The program send these messages to Arduino through USB Serial
3. Another program running on Arduino receives these messages and light up the particular LED(s)
