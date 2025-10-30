Upload file / Import:

1. User upload csv or excel file form front end to vehicle-service controller.
2. validate file type before reach controller
3. Incase file type is not valid, we will not have file in controller there foor check if file exit or not and return error message
4. Find the file type and assign to variable
5. add to bull job

// TODO: if process failed remove the uploaded file

-- in bull process -- 6. parse the data from file 7. validate the data if invalid data add the error row in the array 8. check the valida data array has value if has values insert into db

Notes:
Websocket should be connected when process start only.
