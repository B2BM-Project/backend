pipeline {
    agent {label 'db-server'}
    environment {
        APP_NAME = "Test Node"
    }
    stages {
        stage('Clone GitHub Repository') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'github-admin',
                        usernameVariable: 'githubUser',
                        passwordVariable: 'githubToken'
                    )
                ]) {
                    sh '''
                    cd ~
                    pwd
                    if [ -d "backend" ]; then
                        rm -rf backend
                    fi
                    git clone -b test-pipeline https://github.com/B2BM-Project/backend.git
                    '''
                }
            }
        }
        stage('Install Packages Dependencies') {
            steps {
                sh 'npm install'
            }
        }
        stage('Run API Server') {
            steps {
                sh 'node src/app.js'
            }
        }
    }
}
