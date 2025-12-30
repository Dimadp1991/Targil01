pipeline {
    agent any

    environment {
    IMAGE_TAG = "1.0.${env.BUILD_NUMBER}"
    RELEASE_NAME = "my-app"
    CHART_PATH = "./helm/sample-nodejs"
    GOGS_CREDS = 'gogs-http-creds'
    }

    parameters {
        string(name: 'COMMIT_SHA', defaultValue: 'main', description: 'Commit SHA from Webhook')
    }

    stages {



stage('Quality Gate: Lint & Test') {
            steps {
                sh 'npm install'
                sh 'npx eslint . -f checkstyle -o eslint-report.xml || true'
                sh 'npm test'
            }
            post {
                always {
                    junit 'junit.xml'
                }
            }
        }

        stage('Unit Tests') {
            steps {
                sh 'npm test -- --forceExit --detectOpenHandles'
            }
        }

        stage('DevSecOps: SAST (Semgrep)') {
            steps {
                script {

                    sh "ls -ltr"
                    sh "semgrep scan --config=auto --error --exclude='node_modules/'"
                }
            }
        }

        
        stage('Build Docker Image') {
            steps {
             sh "docker build -t nodejs-app:latest ."
            }
        }

        stage('DevSecOps: Image Scan (Trivy)') {
            steps {
                script {
                    // Fails the pipeline (exit-code 1) if High or Critical vulnerabilities are found
                    sh "docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:latest image nodejs-app:latest"
                }
            }
        }

        stage('Version Bumping and push Image') {
            steps {
                script {
                    // Set git identity for the bump commit
                    sh 'git config user.email "jenkins@example.com"'
                    sh 'git config user.name "Jenkins CI"'
                    
                    sh "npm version patch -m 'chore: bump version to %s ' --force --no-git-tag-version"

                    sh "sed -i 's/tag: .*/tag: ${IMAGE_TAG}/g' helm/sample-nodejs/values.yaml"

                    sh "git add ."
                    sh "git commit -m 'chore: bump version to ${env.BUILD_NUMBER}'"
                    
                
                    sh "git tag v1.0.${env.BUILD_NUMBER}"
                    
                    // Push the version change and tag back to Gogs
                    withCredentials([usernamePassword(credentialsId: "${GOGS_CREDS}", passwordVariable: 'GIT_PASSWORD', usernameVariable: 'GIT_USERNAME')]) {
                        sh "git push http://${GIT_USERNAME}:${GIT_PASSWORD}@gogs:3000/root/app-repo.git HEAD:master"
                        // Push the tags
                        sh "git push http://${GIT_USERNAME}:${GIT_PASSWORD}@gogs:3000/root/app-repo.git --tags"
                    }
                }
            }
        }


        stage('Push Docker Image to Registry') {
            steps {
             sh "docker buildx build --platform linux/amd64 --provenance=false -t 127.0.0.1:5000/nodejs-app:${IMAGE_TAG} --push ."
            }
        }


        // stage('Build Directly in Minikube') {
        //     steps {
        //             script {
        //                 // This command tells the shell to use Minikube's Docker daemon
        //                 // Note: On Windows Jenkins runners, use powershell blocks
        //                 powershell """
        //                     & minikube -p minikube docker-env | Invoke-Expression
        //                     docker build -t nodejs-app:${IMAGE_TAG} .
        //                     docker tag nodejs-app:${IMAGE_TAG} nodejs-app:latest
        //                 """
        //                 echo "Image built directly inside Minikube. No push required."
        //             }
        //     }
        // }

        // stage('Push to Local Registry') {
        //     steps {
        //         script {

        //             sh "docker tag nodejs-app:latest localhost:5000/nodejs-app:${IMAGE_TAG}"
        //             sh "docker tag nodejs-app:latest localhost:5000/nodejs-app:latest"
                    
        //             // 2. Push to the local registry (no login required for default local setup)
        //             sh "docker push localhost:5000/nodejs-app:${IMAGE_TAG}"
        //             sh "docker push localhost:5000/nodejs-app:latest"
                    
        //             echo "Image successfully pushed to http://localhost:5000"
        //         }
        //     }
        // }


        // stage('Cleanup') {
        //     steps {
        //         cleanWs() 
        //     }

        }
}