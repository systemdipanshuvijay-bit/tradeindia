# TradeIndia Proxy API

A proxy API service to fetch TradeIndia leads while handling CloudFront restrictions and providing additional features like rate limiting and input validation.

## Requirements

- Node.js v14.x or higher
- npm v6.x or higher

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Required: Your TradeIndia user ID
USER_ID=your_user_id

# Required: Your TradeIndia profile ID
PROFILE_ID=your_profile_id

# Required: Your TradeIndia API key
KEY=your_api_key

# Optional: Port number for the server (defaults to 3000)
PORT=3000
```

### Environment Variables Description

- `USER_ID`: Your TradeIndia user identification number (Required)
- `PROFILE_ID`: Your TradeIndia profile identification number (Required)
- `KEY`: Your TradeIndia API authentication key (Required)
- `PORT`: The port number where the server will run (Optional, defaults to 3000)

Note: The server will not start if any of the required environment variables (`USER_ID`, `PROFILE_ID`, `KEY`) are missing.

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Dependencies

- express: ^4.18.2 - Web framework
- axios: ^1.7.0 - HTTP client
- cors: ^2.8.5 - CORS middleware
- dotenv: ^16.3.1 - Environment variable management

## Running the Server

### Build the Project
```bash
npm run build
```
This will install all required dependencies.

### Production Mode
```bash
npm start
```
This will start the server in production mode.

### Development Mode
```bash
npm run dev
```
This will start the server in development mode with auto-reload enabled.

## API Endpoints

### GET /fetch-tradeindia

Fetches TradeIndia leads with automatic date handling.

**Query Parameters:**
- `from_date` (optional) - Start date in YYYY-MM-DD format (defaults to today)
- `to_date` (optional) - End date in YYYY-MM-DD format (defaults to today)
- `limit` (optional) - Results per page (default: 100, max: 100)
- `page_no` (optional) - Page number (default: 1)

**Features:**
- Automatic today's date if dates not provided
- Rate limiting (30 requests per minute per IP)
- Input validation
- CORS support
- CloudFront bypass headers

## Error Handling

The API includes comprehensive error handling for:
- Invalid date formats
- Rate limiting exceeded
- Missing environment variables
- API connection issues