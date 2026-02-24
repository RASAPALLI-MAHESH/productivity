package com.productivity.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private Cookie cookie = new Cookie();

    public Cors getCors() {
        return cors;
    }

    public void setCors(Cors cors) {
        this.cors = cors;
    }

    public Cookie getCookie() {
        return cookie;
    }

    public void setCookie(Cookie cookie) {
        this.cookie = cookie;
    }

    public static class Cors {
        private String allowedOrigins = "http://localhost:5173";
        private String allowedMethods = "GET,POST,PUT,DELETE,PATCH,OPTIONS";
        private String allowedHeaders = "*";

        public String getAllowedOrigins() { return allowedOrigins; }
        public void setAllowedOrigins(String allowedOrigins) { this.allowedOrigins = allowedOrigins; }
        public String getAllowedMethods() { return allowedMethods; }
        public void setAllowedMethods(String allowedMethods) { this.allowedMethods = allowedMethods; }
        public String getAllowedHeaders() { return allowedHeaders; }
        public void setAllowedHeaders(String allowedHeaders) { this.allowedHeaders = allowedHeaders; }
    }

    public static class Cookie {
        private boolean secure = false;

        public boolean isSecure() { return secure; }
        public void setSecure(boolean secure) { this.secure = secure; }
    }
}
