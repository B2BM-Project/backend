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
                    git clone https://github.com/B2BM-Project/backend.git
                    '''
                }
            }
        }
    }
}
