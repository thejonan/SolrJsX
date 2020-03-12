pipeline {
  agent any
  stages {
    stage('Build') {
      agent {
        docker {
          image 'node:13-alpine'
        }

      }
      steps {
        sh '''npm update
npm install'''
      }
    }

  }
}