package com.productivity.repository;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.productivity.model.Task;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

@Repository
public class TaskRepository {

    private static final Logger log = LoggerFactory.getLogger(TaskRepository.class);
    private final Firestore firestore;

    public TaskRepository(Firestore firestore) {
        this.firestore = firestore;
    }

    private CollectionReference getCollection(String userId) {
        return firestore.collection("users").document(userId).collection("tasks");
    }

    public Task save(String userId, Task task) throws ExecutionException, InterruptedException {
        DocumentReference docRef;
        if (task.getId() != null) {
            docRef = getCollection(userId).document(task.getId());
        } else {
            docRef = getCollection(userId).document();
            task.setId(docRef.getId());
        }
        task.setUserId(userId);
        docRef.set(task.toMap()).get();
        log.info("Task saved: {} for user: {}", task.getId(), userId);
        return task;
    }

    public Optional<Task> findById(String userId, String taskId) throws ExecutionException, InterruptedException {
        DocumentSnapshot doc = getCollection(userId).document(taskId).get().get();
        if (doc.exists()) {
            return Optional.of(new Task(doc.getData(), doc.getId()));
        }
        return Optional.empty();
    }

    public List<Task> findAll(String userId, String status, String priority, String sortBy,
                               String sortDirection, int page, int size) throws ExecutionException, InterruptedException {
        Query query = getCollection(userId);

        if (status != null && !status.isEmpty()) {
            query = query.whereEqualTo("status", status);
        }
        if (priority != null && !priority.isEmpty()) {
            query = query.whereEqualTo("priority", priority);
        }

        Query.Direction direction = "asc".equalsIgnoreCase(sortDirection) ? Query.Direction.ASCENDING : Query.Direction.DESCENDING;
        String orderField = sortBy != null ? sortBy : "createdAt";
        query = query.orderBy(orderField, direction);

        query = query.offset(page * size).limit(size);

        ApiFuture<QuerySnapshot> future = query.get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();

        List<Task> tasks = new ArrayList<>();
        for (QueryDocumentSnapshot doc : documents) {
            tasks.add(new Task(doc.getData(), doc.getId()));
        }
        return tasks;
    }

    public long count(String userId) throws ExecutionException, InterruptedException {
        AggregateQuerySnapshot snapshot = getCollection(userId).count().get().get();
        return snapshot.getCount();
    }

    public long countByStatus(String userId, String status) throws ExecutionException, InterruptedException {
        AggregateQuerySnapshot snapshot = getCollection(userId)
                .whereEqualTo("status", status).count().get().get();
        return snapshot.getCount();
    }

    public List<Task> findOverdue(String userId, com.google.cloud.Timestamp now) throws ExecutionException, InterruptedException {
        Query query = getCollection(userId)
                .whereLessThan("deadline", now)
                .whereNotEqualTo("status", "done")
                .orderBy("deadline", Query.Direction.ASCENDING);

        List<Task> tasks = new ArrayList<>();
        for (QueryDocumentSnapshot doc : query.get().get().getDocuments()) {
            tasks.add(new Task(doc.getData(), doc.getId()));
        }
        return tasks;
    }

    public List<Task> findByDeadlineRange(String userId, com.google.cloud.Timestamp start,
                                           com.google.cloud.Timestamp end) throws ExecutionException, InterruptedException {
        Query query = getCollection(userId)
                .whereGreaterThanOrEqualTo("deadline", start)
                .whereLessThanOrEqualTo("deadline", end)
                .orderBy("deadline", Query.Direction.ASCENDING);

        List<Task> tasks = new ArrayList<>();
        for (QueryDocumentSnapshot doc : query.get().get().getDocuments()) {
            tasks.add(new Task(doc.getData(), doc.getId()));
        }
        return tasks;
    }

    public void delete(String userId, String taskId) throws ExecutionException, InterruptedException {
        getCollection(userId).document(taskId).delete().get();
        log.info("Task deleted: {} for user: {}", taskId, userId);
    }
}
