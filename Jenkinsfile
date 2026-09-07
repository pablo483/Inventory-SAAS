pipeline {
    agent any

    tools {
        maven 'Maven 3.8'
        nodejs 'Node 18' 
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Backend: Build & Test (Java)') {
            steps {
                dir('backend') {
                    echo 'Building and testing Java backend...'
                    sh 'mvn clean package'
                }
            }
            post {
                always {
                    junit 'backend/target/surefire-reports/*.xml'
                }
            }
        }

        stage('Frontend: Install Dependencies') {
            steps {
                dir('frontend') {
                    echo 'Installing React dependencies...'
                    sh 'npm install'
                }
            }
        }

        stage('Frontend: Test (React)') {
            steps {
                dir('frontend') {
                    echo 'Running React tests...'
                    // Ensure your package.json test script is non-interactive 
                    // (e.g., "test": "react-scripts test --watchAll=false")
                    sh 'npm test'
                }
            }
        }

        stage('Frontend: Build (React)') {
            steps {
                dir('frontend') {
                    echo 'Building React application...'
                    sh 'npm run build'
                }
            }
        }
    }

    post {
        success {
            echo '✅ CI Pipeline completed successfully!'
            // Optional: Archive the build artifacts for deployment
            archiveArtifacts artifacts: 'backend/target/*.jar, frontend/build/**', allowEmptyArchive: true
        }
        failure {
            echo '❌ CI Pipeline failed. Please check the console logs.'
        }
    }
}