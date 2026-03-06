package com.productivity.repository;

import com.google.cloud.firestore.*;
import com.productivity.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.concurrent.ExecutionException;

@Repository
public class UserRepository {

    private static final Logger log = LoggerFactory.getLogger(UserRepository.class);
    private final Firestore firestore;

    public UserRepository(Firestore firestore) {
        this.firestore = firestore;
    }

    private DocumentReference getDocument(String userId) {
        return firestore.collection("users").document(userId);
    }

    public User save(User user) throws ExecutionException, InterruptedException {
        getDocument(user.getUid()).set(user.toMap()).get();
        log.info("User saved: {}", user.getUid());
        return user;
    }

    public Optional<User> findById(String userId) throws ExecutionException, InterruptedException {
        DocumentSnapshot doc = getDocument(userId).get().get();
        if (doc.exists()) {
            return Optional.of(new User(doc.getData(), doc.getId()));
        }
        return Optional.empty();
    }

    public User update(String userId, java.util.Map<String, Object> updates)
            throws ExecutionException, InterruptedException {
        getDocument(userId).update(updates).get();
        log.info("User updated: {}", userId);
        return findById(userId).orElseThrow();
    }

    public Optional<User> findByEmail(String email) throws ExecutionException, InterruptedException {
        Query query = firestore.collection("users").whereEqualTo("email", email).limit(1);
        QuerySnapshot querySnapshot = query.get().get();
        if (!querySnapshot.isEmpty()) {
            QueryDocumentSnapshot doc = querySnapshot.getDocuments().get(0);
            return Optional.of(new User(doc.getData(), doc.getId()));
        }
        return Optional.empty();
    }

    public void delete(String userId) throws ExecutionException, InterruptedException {
        // Recursively delete subcollections
        // 1. Tasks
        deleteCollection(getDocument(userId), "tasks");
        
        // 2. Habits (including their subcollections like logs)
        DocumentReference userRef = getDocument(userId);
        CollectionReference habitsCol = userRef.collection("habits");
        QuerySnapshot habitsSnapshot = habitsCol.get().get();
        for (QueryDocumentSnapshot habitDoc : habitsSnapshot.getDocuments()) {
            deleteCollection(habitDoc.getReference(), "logs");
            habitDoc.getReference().delete().get();
        }
        
        // 3. Delete the user document itself
        userRef.delete().get();
        log.info("Full data cleanup completed for user: {}", userId);
    }

    private void deleteCollection(DocumentReference docRef, String collectionName) throws ExecutionException, InterruptedException {
        CollectionReference collection = docRef.collection(collectionName);
        QuerySnapshot snapshot = collection.get().get();
        for (QueryDocumentSnapshot doc : snapshot.getDocuments()) {
            doc.getReference().delete().get();
        }
        log.info("Deleted collection '{}' for path: {}", collectionName, docRef.getPath());
    }
}
