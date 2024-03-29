# movie_api

## Description
This API provides information about movies their genres and directors. Users can interact with the API to retrieve details about movies, genres, directors, create new users, and manage their favorite movies.

- ![alt text](image.png)

## App Link
- [app link](https://movie-mania-777.netlify.app/login)

## Table of Contents
1. [Endpoints](#endpoints)
2. [Technologies Used](#technologies-used)
3. [Getting Started](#getting-started)
4. [Author](#author)
5. [License](#license)

## Endpoints
1. [Get All Movies](#get-all-movies)
2. [Get Movie by ID or Title](#get-movie-by-id-or-title)
3. [Get Genre Description](#get-genre-description)
4. [Get Director by Name](#get-director-by-name)
5. [Create New User](#create-new-user)
6. [Update User Details](#update-user-details)
7. [Add Movie to User's Favorites](#add-movie-to-users-favorites)
8. [Remove Movie from User's Favorites](#remove-movie-from-users-favorites)
9. [Delete User](#delete-user)

## 1.  Get All Movies
* Request:

  * Method: `GET`
  * URL: `/movies`
  * Request Body: None
- Response:

Format: JSON
Description: A JSON object containing data on all movies.

## 2.  Get Movie by ID
* Request:

  * Method: `GET`
  * URL: `/movies/[id]`
  * Request Body: None
- Response:

Format: JSON
Description: A JSON object containing data about a specific movie, including title, description, director details, genre with description, release date, image URL.

  - Get Movie by Title
- Request:

  - Method: `GET`
  - URL: `/movies/[title]`
  - Request Body: None
- Response:

Format: JSON
Description: A JSON object containing data about a specific movie, including title, description, director details, genre with description, release date, image URL.

## 3. Get Genre Description
- Request:

  - Method: `GET`
  - URL: `/movies/genres/[genreName]`
  - Request Body: None
- Response:

Format: JSON
Description: A JSON object containing data about a specific genre

## 4.  Get Director by Name
- Request:

  - Method: `GET`
  - URL: `movies/directors/[DirectorName]`
  - Request Body: None
- Response:

Format: JSON
Description: A JSON object containing details about a director based on their name (dates of birth and death, short bio).


## 5. Create New User
- Request:

  - Method: `POST`
  - URL: `/users/[Username]`
  - Request Body Format: JSON
    {
      "Name": "tedbundy",
      "Password": "example_password",
      "Email": "useremail@sts.sds",
      "Birthday": "1911-11-11"
    }
- Response:

Format: JSON
Description: A JSON object containing details about the newly created user.


## 6. Update User Details

Request:

Method: `PUT`
- URL: `/users/[Username]`
- Request Body Format: JSON (with at least one updated field)
  
  {
    "Name": "MrNewson",
    "Email": "mrnew@user.co"
  }

## 7. Add Movie to User's Favorites 

Request: 
Method: `POST` 
- URL: `/users/[id]/movies/[movie_id] `
- Request Body: None 
Response: Format: JSON 
Description: Updated user details. 

## 8. Remove Movie from User's Favorites 
- Request: 

Method: `DELETE` 
URL: `/users/[Username]/favoritemovies/[Movie_Id] `
Request Body: None 
- Response: 
Format: JSON Description: Updated user details. 

## 9. Delete User 
- Request: 
Method: `DELETE` 
URL: `/users/[id] Request `
Body: None 
- Response: 
Format: JSON 
Description: A message confirming the removal of the user.

## Technologies Used
- Node.js
- Express.js
- MongoDB with Mongoose
- bcrypt
- body-parser
- cors
- express-validator
- jsonwebtoken
- lodash
- passport
- passport-jwt
- passport-local
- uuid

## Getting Started
1. Install dependencies: `npm install`
2. Start the server:
   - Production: `npm start`
   - Development with nodemon: `npm run dev`

## Author
[rarepearlgirl](https://github.com/rarepearlgirl)

## License
This project is licensed under the [ISC License](https://opensource.org/license/isc-license-txt/).
