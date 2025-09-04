# Multi-stage build for production
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG SUPABASE_URL
ARG PAYSTACK_SECRET_KEY
ARG PAYSTACK_PUBLIC_KEY

# Set environment variables for build
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV NODE_ENV=production
ENV SUPABASE_URL=$SUPABASE_URL
ENV PAYSTACK_SECRET_KEY=$PAYSTACK_SECRET_KEY
ENV PAYSTACK_PUBLIC_KEY=$PAYSTACK_PUBLIC_KEY

# Build the application
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine AS production

# Install Node.js for any server-side needs
RUN apk add --no-cache nodejs npm

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy additional static files
COPY --from=builder /app/public /usr/share/nginx/html

# Create nginx user and set permissions
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 && \
    chown -R nextjs:nodejs /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Expose ports
EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
