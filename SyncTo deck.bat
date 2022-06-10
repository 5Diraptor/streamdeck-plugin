:: @echo off

:: set the source location
set src=C:\Users\tom.morton\OneDrive - Armorgard\PC Files\Documents\GitHub\streamdeck-plugin\Sources\com.5d.dexplorer.sdPlugin

:: set the target location
set trg=C:\Users\tom.morton\AppData\Roaming\Elgato\StreamDeck\Plugins\com.5d.dexplorer.sdPlugin

:: get the current date and time
For /f "tokens=1-3 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%b-%%a)
For /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a.%%b)
set dtm=%mydate%_%mytime%

:: set directory name for archives
set arc=_sync_archive_%dtm%

timeout 1

:: create an archive file in the target directory
CD %trg%
MD %arc%

timeout 1

:: copy the target to an archived backup
ROBOCOPY "%trg%" "%trg%\%arc%" /move /e /XD _*

:: make archive hidden 
attrib +h %arc% /s /d

timeout 1

:: copy the source to the target
ROBOCOPY "%src%" "%trg%" /mir /e /XD _*

msg "%username%" the target has been archived and the source has been synced to the target
pause
