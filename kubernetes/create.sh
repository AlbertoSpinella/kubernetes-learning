echo "Creating pods... Press Enter to confirm"
read a
kubectl apply -f ./kubernetes/pods/

echo "Creating services... Press Enter to confirm"
read a
kubectl apply -f ./kubernetes/svcs/