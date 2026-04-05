# Pawtastic - Pet Social Media Platform

A comprehensive Laravel-based social media platform designed specifically for pets and their owners. Pawtastic allows pets to create profiles, share posts, participate in contests, and connect with other pets in the community.

## 🐾 Features

### User & Pet Management
- **User Registration & Authentication** - Secure signup/login with Laravel Sanctum
- **Multi-Pet Management** - One user can manage multiple pet profiles
- **Pet Profiles** - Complete with name, age, breed, photos, and bio

### Social Features
- **Post Creation** - Pets can create posts with images/videos and captions
- **Feed System** - Personalized feed showing posts from followed pets
- **Follow/Unfollow** - Social networking between pets
- **Like & Comment** - Engagement with emoji reactions
- **Real-time Messaging** - Private chat between pet owners

### Gamification
- **Badge System** - Earn badges for various activities
- **Weekly Contests** - Cutest Photo, Funniest Trick competitions
- **Leaderboards** - Track popular pets and contest winners

### Pet Adoption Board
- **CRUD Adoption Listings** - Post pets looking for homes
- **Search & Filter** - Find pets by breed, age, location
- **Contact Information** - Safe communication channels

## 🛠 Technology Stack

- **Backend**: Laravel 9.x
- **Authentication**: Laravel Sanctum
- **Database**: MySQL with Eloquent ORM
- **API**: RESTful API with comprehensive endpoints
- **Validation**: Form Request validation classes
- **Architecture**: Clean MVC with Service layer

## 📋 Database Schema

### Core Tables
- `users` - User accounts and authentication
- `pets` - Pet profiles linked to users
- `posts` - Content created by pets
- `comments` - Post engagement
- `likes` - Reactions with emoji support
- `followers` - Social connections between pets
- `messages` - Private messaging system
- `badges` - Gamification achievements
- `contests` - Weekly competitions
- `contest_entries` - Contest submissions
- `adoption_listings` - Pet adoption board
- `notifications` - User notification system

## 🚀 Setup Instructions

### Prerequisites
- PHP 8.0+
- MySQL 5.7+ or MariaDB 10.3+
- Composer
- Node.js & NPM (for frontend assets)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pawtastic
   ```

2. **Install dependencies**
   ```bash
   composer install
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. **Database configuration**
   - Update `.env` file with your database credentials:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=pawtastic
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   ```

5. **Run migrations**
   ```bash
   php artisan migrate
   ```

6. **Seed sample data**
   ```bash
   php artisan db:seed
   ```

7. **Start the development server**
   ```bash
   php artisan serve
   ```

## 🔐 Authentication

Pawtastic uses Laravel Sanctum for API authentication:

### Registration
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password",
  "password_confirmation": "password"
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password"
}
```

### API Usage
Include the token in Authorization header:
```http
Authorization: Bearer {token}
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/user` - Get current user

### Pets
- `GET /api/pets` - List all pets (with search)
- `POST /api/pets` - Create new pet
- `GET /api/pets/{id}` - Get pet details
- `PUT /api/pets/{id}` - Update pet
- `DELETE /api/pets/{id}` - Delete pet

### Posts
- `GET /api/posts` - Get feed (followed pets' posts)
- `POST /api/posts` - Create new post
- `GET /api/posts/{id}` - Get post details
- `PUT /api/posts/{id}` - Update post
- `DELETE /api/posts/{id}` - Delete post

### Social Features
- `POST /api/likes` - Like/unlike post
- `POST /api/follow` - Follow a pet
- `DELETE /api/follow/{id}` - Unfollow pet
- `GET /api/posts/{id}/comments` - Get post comments
- `POST /api/comments` - Add comment

### Contests
- `GET /api/contests` - List active contests
- `POST /api/contests/{id}/entries` - Enter contest
- `POST /api/contest-entries/{id}/vote` - Vote for entry

### Adoption
- `GET /api/adoption-listings` - Browse adoption listings
- `GET /api/adoption-listings/available` - Available pets only
- `POST /api/adoption-listings` - Create adoption listing

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/{id}` - Mark as read
- `GET /api/notifications/unread-count` - Unread count

## 🔍 Search & Pagination

Most list endpoints support:
- **Search**: `?search=keyword`
- **Pagination**: Default 15 items per page
- **Filters**: Various model-specific filters

Example:
```http
GET /api/pets?search=golden&per_page=10
```

## 🎯 Gamification System

### Badge Categories
- **Social**: Following, likes, comments
- **Content**: Posts, photos, videos
- **Contest**: Participation and wins
- **Adoption**: Helping pets find homes
- **Special**: Early adopter, milestones

### Weekly Contests
- **Cutest Photo** - Visual appeal competition
- **Funniest Trick** - Skill and talent showcase
- **Popular Pet** - Most followers/engagement

## 🔔 Notification System

Real-time notifications for:
- New followers
- Likes and comments
- Contest results
- Messages
- Adoption inquiries

## 🛡 Security Features

- **Authentication**: Laravel Sanctum tokens
- **Authorization**: Role-based access control
- **Validation**: Comprehensive input validation
- **CSRF Protection**: Built-in Laravel protection
- **SQL Injection**: Eloquent ORM protection
- **XSS Prevention**: Input sanitization

## 📝 Code Quality

- **Clean Architecture**: Separation of concerns
- **Form Requests**: Centralized validation
- **Resource Controllers**: Consistent CRUD operations
- **API Resources**: Consistent JSON responses
- **Error Handling**: Proper HTTP status codes
- **Comments**: Comprehensive code documentation

## 🧪 Testing

```bash
# Run all tests
php artisan test

# Run specific test
php artisan test --filter PetTest

# Generate test coverage
php artisan test --coverage
```

## 📦 Deployment

### Production Setup
1. Set environment variables
2. Run `php artisan config:cache`
3. Run `php artisan route:cache`
4. Run `php artisan migrate --force`
5. Set up file permissions
6. Configure web server (nginx/Apache)

### Environment Variables
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com

DB_CONNECTION=mysql
DB_DATABASE=pawtastic_prod

SANCTUM_STATEFUL_DOMAINS=your-domain.com
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review existing issues

---

**Built with ❤️ for pet lovers everywhere!**
