import React from 'react';
import { useHabitStore } from '../store/habitStore';

export const HabitsCommandBar: React.FC = () => {
    const {
        searchQuery, setSearchQuery,
        sortOption, setSortOption,
        filterCategory, setFilterCategory
    } = useHabitStore();

    return (
        <div className="habits-command-bar">
            <div className="habits-search-wrapper">
                <span className="material-icons search-icon">search</span>
                <input
                    type="text"
                    placeholder="Search habits... (Press '/')"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="habits-search-input"
                />
            </div>

            <div className="habits-filters">
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="habits-filter-select"
                >
                    <option value="all">All Categories</option>
                    <option value="health">Health</option>
                    <option value="learning">Learning</option>
                    <option value="work">Work</option>
                    <option value="personal">Personal</option>
                </select>

                <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as any)}
                    className="habits-filter-select"
                >
                    <option value="Recently Created">Recently Created</option>
                    <option value="Most Streak">Highest Streak</option>
                    <option value="Completion Rate">Completion Rate</option>
                    <option value="Alphabetical">Alphabetical</option>
                </select>
            </div>
        </div>
    );
};
