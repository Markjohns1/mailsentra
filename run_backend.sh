#!/bin/bash
cd backend
uvicorn main:app --host localhost --port 8000 --reload
