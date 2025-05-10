pipeline {
    agent any
    
    environment {
        APP_NAME = "my-nextjs-app"
        APP_DIR = "/home/ubuntu/app"
        APP_USER = "ubuntu"
        PATH = "/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin:${env.PATH}"
        // Load DATABASE_URL from Jenkins credentials (must be set up in Jenkins first)
        DATABASE_URL = credentials('DATABASE_URL_SECRET') 
    }
    
    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main', 
                url: 'https://github.com/rakeshkanneeswaran/null-pod-task'
            }
        }

        stage('Prepare EC2 Deployment') {
            steps {
                sh """
                    sudo -u ${APP_USER} bash -c '
                        # Clean app directory
                        rm -rf ${APP_DIR}/*
                        
                        # Copy Jenkins workspace files to app dir
                        cp -r ${WORKSPACE}/* ${APP_DIR}/
                    '
                """
            }
        }

        stage('Deploy with Docker Compose') {
            steps {
                sh """
                    sudo -u ${APP_USER} bash -c '
                        cd ${APP_DIR}
                        
                        # Create .env file with database URL
                        echo "DATABASE_URL=${DATABASE_URL}" > .env
                        
                        # Ensure proper permissions
                        chmod 600 .env
                        
                        # Stop existing containers and rebuild
                        sudo docker-compose down
                        sudo docker-compose up -d --build
                        
                        # Verify containers are running
                        sudo docker ps
                    '
                """
            }
        }
    }
    
    post {
        always {
            // Clean up workspace after build
            cleanWs()
        }
    }
}