pipeline {
  agent any
  stages {
    stage('Build') {
      agent {
        docker {
          image 'node:13-alpine'
          args '-e HOME=/tmp -v nanosearch_ui-npm_cache:/tmp/.npm'
        }

      }
      steps {
        sh 'npm ci --no-optional'
      }
    }

  }
}