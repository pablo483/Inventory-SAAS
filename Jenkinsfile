pipeline {
    agent  {
        label 'worker'
    }

    tools {
        maven 'maven 3.9'
        nodejs 'node 26'
        jdk 'JDK 21'
    }

    environment {
        DOCKER_IMAGE     = 'sudipkdka/inventory-saas'
        DOCKER_TAG       = "${env.GIT_COMMIT[0..6]}"         
        DOCKER_LATEST    = 'latest'

        // Credentials IDs configured in Jenkins
        DOCKERHUB_CREDS  = 'docker-hub-credentials'          
        // DEPLOY_HOST   = credentials('deploy-server-host')   
        // SSH_KEY       = credentials('deploy-ssh-key')     
        // SLACK_CREDS   = 'slack-webhook'                 

        MAVEN_OPTS       = '-Dmaven.repo.local=.m2/repository'
    }

    triggers {
        pollSCM('H/5 * * * *')
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
        timestamps()
    }

    stages {
        stage('Checkout') {
            steps {
                echo "Checking out branch: ${env.BRANCH_NAME}"
                checkout scm
            }
        }

        stage('Backend: Build & Test') {
            steps {
                echo ' Building and testing Spring Boot backend...'
                sh './mvnw clean package -B'
            }
            post {
                always {
                    junit allowEmptyResults: true,
                          testResults: 'target/surefire-reports/*.xml'
                }
            }
        }

        stage('Frontend: Install') {
            steps {
                dir('frontend') {
                    sh 'npm ci'
                }
            }
        }

        stage('Frontend: Lint & Type Check') {
            steps {
                dir('frontend') {
                    sh 'npm run lint || true'
                    sh 'npx tsc --noEmit'
                }
            }
        }

        stage('Frontend: Build') {
            steps {
                dir('frontend') {
                    sh 'npm run build'
                }
            }
        }

        stage('Docker: Build Image') {
            steps {
                echo "Building Docker image: ${DOCKER_IMAGE}:${DOCKER_TAG}"
                sh """
                    docker build \
                        --cache-from ${DOCKER_IMAGE}:${DOCKER_LATEST} \
                        --tag ${DOCKER_IMAGE}:${DOCKER_TAG} \
                        --tag ${DOCKER_IMAGE}:${DOCKER_LATEST} \
                        .
                """
            }
        }

        stage('Docker: Push to Registry') {
            when {
                branch 'main'
            }
            steps {
                echo "Pushing image to Docker Hub..."
                withCredentials([usernamePassword(
                    credentialsId: "${DOCKERHUB_CREDS}",
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh """
                        echo "${DOCKER_PASS}" | docker login -u "${DOCKER_USER}" --password-stdin
                        docker push ${DOCKER_IMAGE}:${DOCKER_TAG}
                        docker push ${DOCKER_IMAGE}:${DOCKER_LATEST}
                        docker logout
                    """
                }
            }
        }

        stage('Deploy: Server') {
            when {
                branch 'main'
            }
            steps {
                echo "Deploying to server..."
                withCredentials([sshUserPrivateKey(
                    credentialsId: "${SSH_KEY}",
                    keyFileVariable: 'KEY_FILE',
                    usernameVariable: 'SSH_USER'
                )]) {
                    sh """
                        ssh -i ${KEY_FILE} \
                            -o StrictHostKeyChecking=no \
                            ${SSH_USER}@${DEPLOY_HOST} \
                            'docker pull ${DOCKER_IMAGE}:${DOCKER_TAG} && \
                             docker stop inventory-app || true && \
                             docker rm inventory-app || true && \
                             docker run -d \
                               --name inventory-app \
                               --env-file /opt/inventory-saas/.env \
                               -p 8080:8080 \
                               --restart always \
                               ${DOCKER_IMAGE}:${DOCKER_TAG}'
                    """
                }
            }
        }
    } 

    post {
        success {
            echo 'Pipeline completed successfully!'
            archiveArtifacts artifacts: 'target/*.jar, frontend/dist/**',
                             allowEmptyArchive: true,
                             fingerprint: true
            slackSend(
                channel: '#deployments',
                color: 'good',
                message: "*BUILD SUCCESS*\nBranch: `${env.BRANCH_NAME}`\nCommit: `${DOCKER_TAG}`\nBuild: <${env.BUILD_URL}|#${env.BUILD_NUMBER}>"
            )
        }
        failure {
            echo 'Pipeline failed!'
            slackSend(
                channel: '#deployments',
                color: 'danger',
                message: "*BUILD FAILED*\nBranch: `${env.BRANCH_NAME}`\nCommit: `${DOCKER_TAG}`\nBuild: <${env.BUILD_URL}|#${env.BUILD_NUMBER}>"
            )
        }
        always {
            sh "docker rmi ${DOCKER_IMAGE}:${DOCKER_TAG} || true"
            sh "docker rmi ${DOCKER_IMAGE}:${DOCKER_LATEST} || true"
            cleanWs()
        }
    }
}