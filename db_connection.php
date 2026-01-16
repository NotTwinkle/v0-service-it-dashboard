<?php
/**
 * Database Connection Configuration
 * Service IT Dashboard - MySQL Database Connection
 */

// Database credentials
define('DB_HOST', '192.168.2.18');
define('DB_PORT', '3306');
define('DB_USER', 'sitadmin1110');
define('DB_PASS', '!S3rv1c31T+Op3r@t10n$2025@dm1n!');
define('DB_NAME', ''); // Update with your database name

/**
 * Create and return a PDO database connection
 * @return PDO|null Database connection object or null on failure
 */
function getDBConnection() {
    try {
        // Build DSN (Data Source Name)
        $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT;
        
        // Add database name if specified
        if (!empty(DB_NAME)) {
            $dsn .= ";dbname=" . DB_NAME;
        }
        
        // Create PDO connection with error handling
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
        ];
        
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        
        return $pdo;
        
    } catch (PDOException $e) {
        // Log error (don't expose credentials in production)
        error_log("Database Connection Error: " . $e->getMessage());
        
        // Return null on failure
        return null;
    }
}

/**
 * Test database connection
 * @return bool True if connection successful, false otherwise
 */
function testConnection() {
    $conn = getDBConnection();
    if ($conn) {
        echo "Database connection successful!\n";
        $conn = null; // Close connection
        return true;
    } else {
        echo "Database connection failed!\n";
        return false;
    }
}

// Uncomment the line below to test the connection
// testConnection();
?>
