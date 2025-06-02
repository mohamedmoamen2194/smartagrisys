-- Create databases for each service
CREATE DATABASE agrismart_customer;
CREATE DATABASE agrismart_product;
CREATE DATABASE agrismart_order;
CREATE DATABASE agrismart_farmer;
CREATE DATABASE agrismart_sensor;
CREATE DATABASE agrismart_image;
CREATE DATABASE agrismart_logistics;

-- Grant privileges (adjust username as needed)
GRANT ALL PRIVILEGES ON DATABASE agrismart_customer TO postgres;
GRANT ALL PRIVILEGES ON DATABASE agrismart_product TO postgres;
GRANT ALL PRIVILEGES ON DATABASE agrismart_order TO postgres;
GRANT ALL PRIVILEGES ON DATABASE agrismart_farmer TO postgres;
GRANT ALL PRIVILEGES ON DATABASE agrismart_sensor TO postgres;
GRANT ALL PRIVILEGES ON DATABASE agrismart_image TO postgres;
GRANT ALL PRIVILEGES ON DATABASE agrismart_logistics TO postgres; 