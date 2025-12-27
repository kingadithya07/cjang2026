
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SupabaseService } from '../../core/services/supabase-mock.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div class="max-w-7xl mx-auto">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
           <div>
             <h1 class="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
             <p class="text-sm text-gray-500 mt-1">Welcome back, {{ auth.user()?.email }}</p>
           </div>
           <div class="flex gap-3">
             <a routerLink="/admin/articles/new" class="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm transition">
               <span class="material-icons text-sm mr-2">add</span> New Article
             </a>
           </div>
        </div>

        <!-- Stats Overview -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          @if (loading()) {
            <!-- Skeletons -->
            @for (i of [1,2,3,4]; track i) {
               <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-pulse">
                 <div class="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                 <div class="h-8 bg-gray-200 rounded w-1/4"></div>
               </div>
            }
          } @else {
            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition relative overflow-hidden group">
              <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition">
                 <span class="material-icons text-6xl text-indigo-600">article</span>
              </div>
              <p class="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Articles</p>
              <p class="text-3xl font-extrabold text-gray-900 mt-2">128</p>
              <div class="mt-4 flex items-center text-sm text-green-600">
                <span class="material-icons text-sm mr-1">trending_up</span>
                <span class="font-medium">12% increase</span>
              </div>
            </div>

            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition relative overflow-hidden group">
              <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition">
                 <span class="material-icons text-6xl text-green-600">check_circle</span>
              </div>
              <p class="text-sm font-medium text-gray-500 uppercase tracking-wider">Published</p>
              <p class="text-3xl font-extrabold text-gray-900 mt-2">94</p>
              <div class="mt-4 flex items-center text-sm text-gray-500">
                <span>73% of total content</span>
              </div>
            </div>

            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition relative overflow-hidden group">
              <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition">
                 <span class="material-icons text-6xl text-yellow-600">edit_note</span>
              </div>
              <p class="text-sm font-medium text-gray-500 uppercase tracking-wider">Drafts</p>
              <p class="text-3xl font-extrabold text-gray-900 mt-2">12</p>
              <div class="mt-4 flex items-center text-sm text-yellow-600">
                <span class="material-icons text-sm mr-1">warning</span>
                <span>Needs review</span>
              </div>
            </div>

            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition relative overflow-hidden group">
               <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition">
                 <span class="material-icons text-6xl text-purple-600">people</span>
              </div>
              <p class="text-sm font-medium text-gray-500 uppercase tracking-wider">Readers</p>
              <p class="text-3xl font-extrabold text-gray-900 mt-2">1.4k</p>
              <div class="mt-4 flex items-center text-sm text-green-600">
                <span class="material-icons text-sm mr-1">trending_up</span>
                <span>+45 this week</span>
              </div>
            </div>
          }
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Recent Activity -->
          <div class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 class="font-bold text-gray-800 flex items-center gap-2">
                <span class="material-icons text-gray-400 text-sm">history</span> Recent Activity
              </h3>
              <a routerLink="/admin/articles" class="text-indigo-600 text-sm font-medium hover:text-indigo-800 hover:underline">View All</a>
            </div>
            
            <div class="divide-y divide-gray-100">
              @if (loading()) {
                @for (i of [1,2,3]; track i) {
                   <div class="p-4 animate-pulse">
                     <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                     <div class="h-3 bg-gray-200 rounded w-1/4"></div>
                   </div>
                }
              } @else {
                <div class="p-4 hover:bg-gray-50 transition group cursor-default">
                  <div class="flex justify-between items-start">
                    <div>
                      <p class="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition">Tech Giants Announce Merger</p>
                      <p class="text-xs text-gray-500 mt-1">Edited by <span class="text-gray-700">John Doe</span></p>
                    </div>
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      Published
                    </span>
                  </div>
                  <p class="text-xs text-gray-400 mt-2 flex items-center">
                    <span class="material-icons text-[10px] mr-1">schedule</span> 2 hours ago
                  </p>
                </div>
                
                <div class="p-4 hover:bg-gray-50 transition group cursor-default">
                   <div class="flex justify-between items-start">
                    <div>
                      <p class="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition">Local Sports Team Wins Championship</p>
                      <p class="text-xs text-gray-500 mt-1">Created by <span class="text-gray-700">Sarah Smith</span></p>
                    </div>
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                      Draft
                    </span>
                  </div>
                  <p class="text-xs text-gray-400 mt-2 flex items-center">
                    <span class="material-icons text-[10px] mr-1">schedule</span> 5 hours ago
                  </p>
                </div>

                <div class="p-4 hover:bg-gray-50 transition group cursor-default">
                   <div class="flex justify-between items-start">
                    <div>
                      <p class="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition">Market Watch: Monday Edition</p>
                       <p class="text-xs text-gray-500 mt-1">Published by <span class="text-gray-700">Finance Team</span></p>
                    </div>
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      Published
                    </span>
                  </div>
                  <p class="text-xs text-gray-400 mt-2 flex items-center">
                    <span class="material-icons text-[10px] mr-1">schedule</span> 1 day ago
                  </p>
                </div>
              }
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit">
            <h3 class="font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span class="material-icons text-gray-400 text-sm">bolt</span> Quick Actions
            </h3>
            <div class="grid grid-cols-2 gap-4">
              <a routerLink="/admin/articles/new" class="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-300 transition group cursor-pointer text-center">
                <div class="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-indigo-200 transition">
                  <span class="material-icons text-indigo-600">post_add</span>
                </div>
                <span class="text-xs font-bold text-gray-600 group-hover:text-indigo-700">Write Article</span>
              </a>
              
              <a routerLink="/admin/articles" class="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-300 transition group cursor-pointer text-center">
                 <div class="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-200 transition">
                  <span class="material-icons text-blue-600">list_alt</span>
                </div>
                <span class="text-xs font-bold text-gray-600 group-hover:text-indigo-700">Manage Content</span>
              </a>
              
              <a routerLink="/epaper" class="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-300 transition group cursor-pointer text-center">
                 <div class="h-10 w-10 bg-pink-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-pink-200 transition">
                  <span class="material-icons text-pink-600">newspaper</span>
                </div>
                <span class="text-xs font-bold text-gray-600 group-hover:text-indigo-700">E-Paper Edition</span>
              </a>
              
              <div class="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-300 transition group cursor-pointer text-center">
                 <div class="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-gray-200 transition">
                  <span class="material-icons text-gray-600">settings</span>
                </div>
                <span class="text-xs font-bold text-gray-600 group-hover:text-indigo-700">Settings</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  auth = inject(SupabaseService);
  loading = signal(true);

  ngOnInit() {
    // Simulate data loading
    setTimeout(() => {
      this.loading.set(false);
    }, 1000);
  }
}
