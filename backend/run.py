import uvicorn # uvicorn is a ASGI server that runs the application. it is a web server that runs the application. it

if __name__ == "__main__": # this is the main function that runs the application
    uvicorn.run( # uvicorn is a ASGI server that runs the application. it is a web server that runs the application.
        "main:app", # main is the file that contains the application. app is the application instance.
        host="0.0.0.0", # host is the host address of the application.
        port=8000, # port is the port number of the application.
        reload=True # reload is a boolean that tells the application to reload the application when the code changes.
    ) 
    # uvicorn.run is a function that runs the application. it is a web server that runs the application.
    # main:app is the file that contains the application. app is the application instance.
    # host="0.0.0.0" is the host address of the application.
    # port=8000 is the port number of the application.
    # reload=True is a boolean that tells the application to reload the application when the code changes.