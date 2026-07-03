import mongoose from "mongoose";

// Disable strict SSL verification for development (fixes certificate issues)
if (process.env.NODE_ENV === 'development') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const connectDB = async () => {
    try {
        // Connection options for MongoDB Atlas
        const options = {
            serverSelectionTimeoutMS: 10000,     // Timeout after 10s
            socketTimeoutMS: 45000,               // Close sockets after 45s
            family: 4,                            // Use IPv4, skip trying IPv6
            tls: true,                            // Enable TLS/SSL
            tlsAllowInvalidCertificates: true,    // Allow self-signed/invalid certificates
            tlsAllowInvalidHostnames: true,       // Allow hostname mismatches
        };

        const conn = await mongoose.connect(process.env.MONGO_URI, options);

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name || 'mathmentor'}`);
    } catch (error) {
        console.error("❌ MongoDB Connection Failed");
        console.error(error.message);
        
        // Provide helpful error messages
        if (error.message.includes('querySrv') || error.message.includes('ECONNREFUSED')) {
            console.error('\n⚠️  Cannot resolve MongoDB Atlas hostname');
            console.error('Solutions:');
            console.error('1. Check your internet connection');
            console.error('2. Disable VPN if active');
            console.error('3. Try flushing DNS: ipconfig /flushdns');
            console.error('4. Check firewall/antivirus settings');
        } else if (error.message.includes('certificate')) {
            console.error('\n⚠️  SSL Certificate Error (Network/Firewall issue)');
            console.error('This usually means antivirus/firewall is intercepting SSL');
            console.error('Try: Disable antivirus temporarily or use mobile hotspot');
        } else if (error.message.includes('authentication failed')) {
            console.error('\n⚠️  Authentication Failed');
            console.error('Check MongoDB username/password in .env file');
        }
        
        process.exit(1);
    }
};

export default connectDB;