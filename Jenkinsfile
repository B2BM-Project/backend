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
    }
}
