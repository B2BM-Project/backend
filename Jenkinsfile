pipeline {
    agent {label 'db-server'}
    environment {
        APP_NAME = "
        Repo_NAME = ""
    }
    stages {
        stage('Clone GitHub Repository') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'github-id', // อ้างอิงถึง Credentials ที่เพิ่มไว้
                        usernameVariable: 'githubUser', // ตัวแปรสำหรับ username
                        passwordVariable: 'githubToken' // ตัวแปรสำหรับ PAT
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
