<?php
/**
 * Test Database Connection
 * This script tests the database connection
 */

require_once 'db_connection.php';

echo "Testing database connection...\n";
echo "================================\n\n";

// Test connection
try {
    $conn = getDBConnection();
    
    if ($conn) {
        echo "✓ Database connection successful!\n\n";
        
        // Get MySQL version
        $version = $conn->query('SELECT VERSION()')->fetchColumn();
        echo "MySQL Version: " . $version . "\n";
        
        // List databases
        echo "\nAvailable databases:\n";
        $databases = $conn->query('SHOW DATABASES')->fetchAll(PDO::FETCH_COLUMN);
        foreach ($databases as $db) {
            echo "  - " . $db . "\n";
        }
        
        // Close connection
        $conn = null;
        echo "\n✓ Connection closed successfully.\n";
        
    } else {
        echo "✗ Database connection failed!\n";
        exit(1);
    }
    
} catch (PDOException $e) {
    echo "✗ Connection Error: " . $e->getMessage() . "\n";
    exit(1);
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
    exit(1);
}

echo "\n================================\n";
echo "Test completed successfully!\n";
?>
