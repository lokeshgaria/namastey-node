# API'S LIST FOR DEV-TINDER

## authRouter
-POST /auth/signup
-POST /auth/login
-POST /auth/logout

## profileRouter
-PATCH /profile/edit
-GET /profile/view
-PATCH /profile/patch-password

## connectionRequestRouter
-POST /request/send/:status/:userId
 
-POST /request/review/:status/:requestId
 

## userRouter
-GET /user/connection
-GET /user/request/received
-GET /user/feed - get the profiles list

Status : ignored , interested , accepted , rejected 



# default users
{
     "firstName": "lokesh",
       "lastName": "garia",
      "email": "lokeshgaria8811@gmail.com",
      "age": 25,
      "gender":"male",
      "password":"Lokesh@12345"
},

{
"email": "tw1i1tty@gmail.com",
"password":"1234@Lokesh"
} 

## thought process of the api

- write code with proper validation for POST /reuests
- Thought process - POST vs GET
- read about ref and populate

/feed?page=1&limit=10 => first 10 users 1-10

/feed?page=2&limit=10 > 11- 20

-- mongo methods 
skip(0)  --> skipping 0 users
 &
limit(10) --> limiting 10 users