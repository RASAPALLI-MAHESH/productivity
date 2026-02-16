package com.productivity.repository;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.productivity.model.Habit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

@Repository
public class HabitRepository {

    private static final Logger log = LoggerFactory.getLogger(HabitRepository.class);
    private final Firestore firestore;

    public HabitRepository(Firestore firestore) {
        this.firestore = firestore;
    }

    private CollectionReference getCollection(String userId) {
        return firestore.collection("users").document(userId).collection("habits");
    }

    public Habit save(String userId, Habit habit) throws ExecutionException, InterruptedException {
        DocumentReference docRef;
        if (habit.getId() != null) {
            docRef = getCollection(userId).document(habit.getId());
        } else {
            docRef = getCollection(userId).document();
            habit.setId(docRef.getId());
        }
        habit.setUserId(userId);
        docRef.set(habit.toMap()).get();
        log.info("Habit saved: {} for user: {}", habit.getId(), userId);
        return habit;
    }

    public Optional<Habit> findById(String userId, String habitId) throws ExecutionException, InterruptedException {
        DocumentSnapshot doc = getCollection(userId).document(habitId).get().get();
        if (doc.exists()) {
            return Optional.of(new Habit(doc.getData(), doc.getId()));
        }
        return Optional.empty();
    }

    public List<Habit> findAll(String userId) throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> future = getCollection(userId)
                .orderBy("createdAt", Query.Direction.DESCENDING).get();
        List<Habit> habits = new ArrayList<>();
        for (QueryDocumentSnapshot doc : future.get().getDocuments()) {
            habits.add(new Habit(doc.getData(), doc.getId()));
        }
        return habits;
    }

    public void delete(String userId, String habitId) throws ExecutionException, InterruptedException {
        getCollection(userId).document(habitId).delete().get();
        log.info("Habit deleted: {} for user: {}", habitId, userId);
    }
}
